import { validateRequest } from "@/auth"
import { redirect } from "next/navigation";

export default async function Layout({children}:{children: React.ReactNode}) {
   const {user} = await validateRequest();
   if(user) {
    console.log(user)
    redirect("/");
   }

   return <>{children}</>
}
