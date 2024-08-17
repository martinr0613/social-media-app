import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import GoogleSignInButton from "./google/GoogleSignInButton";

export const metadata: Metadata = {
    title: "Login"
}
export default function Page() {
    return(
    <main className="flex h-screen items-center justify-center p-5">
        <div className="flex h-full max-h-[40-rem] w-full max-w-[64rem]
        rounded-2xl overflow-hidden bg-card shadow-2xl">
            <div className="w-full md:w-1/2 space-y-10 overflow-y-auto p-10">
                <h1 className="text-3xl font-bold text-center">
                    Login
                </h1>
                <GoogleSignInButton/>
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-muted">

                    </div>
                    <span>OR</span>
                    <div className="h-px flex-1 bg-muted">
                        
                    </div>
                </div>
                <LoginForm/>
                <Link href={"/signup"} 
                    className="block text-center hover:underline">
                        Don&apos;t have an account? Sign up

                </Link>
            </div>
        </div>
    </main>
    )
}