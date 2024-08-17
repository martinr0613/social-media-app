"use client";

import { useForm } from "react-hook-form";
import { signupSchema, SignUpValues } from '../../../lib/validation';
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { signUp } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

export default function SignupForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        email: "", username: "", password: ""
    }
  });

  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
        const {error} = await signUp(values);
        if(error) setError(error);
    } );
  }

  return (
    <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-3">
            { error && 
            <p className="text-center text-destructive">
                {error}
            </p> }
            <FormField 
                control={form.control}
                name="username"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input placeholder="Username" 
                                {...field}/>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField 
                control={form.control}
                name="email"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Email" 
                                type="email" {...field}/>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField 
                control={form.control}
                name="password"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <PasswordInput placeholder="Password" {...field}/>
                        </FormControl>
                    </FormItem>
                )}
            />
            <LoadingButton loading={isPending} type="submit" className="w-full">
                Create account
            </LoadingButton>
        </form>
    </Form>
  )
}
