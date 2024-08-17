import { validateRequest } from "@/auth"
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";

export default async function Layout({children}:{children: React.ReactNode}) {
   const session = await validateRequest();
   if(!session.user) {
      console.log("j")

    redirect("/login");
   }
   return (
   <SessionProvider value={session}>
      <div className="flex flex-col min-h-screen">
         <Navbar/>
         <div className="flex grow w-full max-w-7xl mx-auto p-5 gap-5">
            <MenuBar className="sticky top-[5.25rem] h-fit hidden 
            sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5
            lg:px-5 shadow-sm xl:w-80" />
            {children}
         </div>
         <MenuBar className="flex w-full sticky bottom-0 justify-center
         gap-5 border-t bg-card p-3 sm:hidden"/>
      </div>
    </SessionProvider>
   )
}
