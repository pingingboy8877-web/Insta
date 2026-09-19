import type { Config } from "@netlify/functions";
const cache=new Map<string,{expires:number,data:any}>();
const valid=(u:string)=>/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+/i.test(u);
const clean=(u:string)=>u.split("?")[0].replace(/\/$/,"");
export default async(req:Request)=>{
 if(req.method!=="POST")return Response.json({error:"POST required"},{status:405});
 let body:any;try{body=await req.json()}catch{return Response.json({error:"Invalid JSON"},{status:400})}
 const postUrl=clean(String(body?.url||""));if(!valid(postUrl))return Response.json({error:"Only public Instagram post, reel, and video URLs are supported."},{status:400});
 const hit=cache.get(postUrl);if(hit&&hit.expires>Date.now())return Response.json(hit.data);
 const token=Netlify.env.get("INSTAGRAM_ACCESS_TOKEN");const id=postUrl.match(/\/(?:p|reel|tv)\/([^/]+)/i)?.[1]||"";
 if(!token){const data={postUrl,type:postUrl.includes("/reel/")?"video":"image",title:"Instagram post",description:"Connect an authorized Instagram Graph API token to enable server-side media resolution and downloads.",mediaUrl:null,downloadUrl:null,shortcode:id};cache.set(postUrl,{expires:Date.now()+30000,data});return Response.json(data)}
 try{const api=new URL("https://graph.instagram.com/"+id);api.searchParams.set("fields","id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,username");api.searchParams.set("access_token",token);const upstream=await fetch(api);const json:any=await upstream.json();if(!upstream.ok||json.error)return Response.json({error:"Instagram did not return an accessible media object. Check the token and authorization."},{status:422});const mediaUrl=json.media_url||json.thumbnail_url||null;const type=String(json.media_type||"IMAGE").toLowerCase()==="video"?"video":"image";const data={postUrl:json.permalink||postUrl,type,title:json.username?"@"+json.username:"Instagram media",description:json.caption||"Public Instagram media",mediaUrl,downloadUrl:mediaUrl,shortcode:id};cache.set(postUrl,{expires:Date.now()+60000,data});return Response.json(data,{headers:{"Cache-Control":"public, max-age=60"}})}catch{return Response.json({error:"Media resolution service is temporarily unavailable."},{status:502})}
};
export const config:Config={path:"/api/resolve"};