import Storefront from "../../Storefront";
export default async function Page({params}:{params:Promise<{siteSlug:string;path?:string[]}>}){const {siteSlug,path}=await params;return <Storefront lookup={{siteSlug,path}}/>}
