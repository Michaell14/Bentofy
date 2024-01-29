import { Outlet } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const signUpSchema = z.object({
    email: z.string().min(2).max(50),
    bentoId: z.string().min(1).max(20)
});

const loginSchema = z.object({
    email: z.string().min(2).max(50),
});

function Landing() {

    const { toast } = useToast();
    const supabase = useSupabaseClient();
    const user = useUser();
    const navigate = useNavigate();
    const [bentoId, setBentoId] = useState("");
    const [tabValue, setTabValue] = useState("Sign Up");

    const signUpForm = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            bentoId: "",
        },
    })
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: ""
        },
    })


    supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION') {
            getBentoId();
        }
    })

    async function getBentoId() {
        if (user) {
            let { data } = await supabase
                .from('Table')
                .select('bentoId').eq("user_id", user.id);
            if (data && data.length) {
                setBentoId(data[0].bentoId);
            }
        }
    }

    async function checkValidBentoId(id: string){
        
        let { data } = await supabase
        .from('Table')
        .select('bentoId').eq("bentoId", id);
        if (data && data.length > 0) {
            return false;
        }
        return true;
    }

    async function onSubmitLogin(values: z.infer<typeof loginSchema>) {
        
        const { error } = await supabase.auth.signInWithOtp({
            email: values.email,
            options: {
                shouldCreateUser: false
            }
        });

        if (error) {
            toast({
                title: "Error",
                description: error.message 
            });
        } else {
            toast({
                title: "Check your email",
                description: "Check your email for a one time link. You may need to check your spam.",
            });
        }
    }

    async function onSubmitSignUp(values: z.infer<typeof signUpSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        checkValidBentoId(values.bentoId).then((res) => {
            if (!res) {
                toast({
                    title: "Oops, someone took your favorite id.",
                    description: "This already exists too bad so sad.",
                })
                return;
            } else {
                signUp();
            }
        }) 
        
        async function signUp() {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: uuidv4(),
            });
    
            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                });
            } else {
                if (data && data.user) {
                    await supabase
                    .from('Table')
                    .insert({ user_id: data.user.id, blocks: [], bentoId: values.bentoId });
                    toast({
                        title: "Success!",
                        description: "Please continue to your bento page.",
                    });
                    setTabValue("Log in");
                }
            }
        }
        
    }

    return (
        <>
            <div className="grid grid-cols-1 h-full mt-8 gap-4 place-content-center">
                <p className="text-6xl font-extrabold">Bento-fy Your Life!🍱</p>
                <p className="text-slate-500">Create your own custom shareable bento grid</p>
                { !user ?
                <div className="flex place-content-center mt-5">
                    
                    <Tabs defaultValue="Sign Up" value={tabValue} onValueChange={(e) => setTabValue(e)} className="w-[420px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="Sign Up">Sign Up</TabsTrigger>
                            <TabsTrigger value="Log in">Log In</TabsTrigger>
                        </TabsList>
                        <TabsContent value="Sign Up">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sign Up</CardTitle>
                                    <CardDescription>
                                        Make changes to your account here. Click save when you're done.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">

                                    <Form {...signUpForm}>
                                        <form onSubmit={signUpForm.handleSubmit(onSubmitSignUp)} className="space-y-4">
                                            <FormField
                                                control={signUpForm.control}
                                                name="bentoId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="space-y-1 flex place-content-center">
                                                            <FormLabel className="mt-2 text-xl fotn-mono font-bold">Bentofy.vercel.app/</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Bento-Id" {...field} />
                                                            </FormControl>
                                                        </div>
                                                        <FormDescription>
                                                            This will be your unique link.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signUpForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Email" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Make your bento look delicious.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit">Submit</Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="Log in">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Log In</CardTitle>
                                    <CardDescription>
                                        We will send you a One-Time-Link to log you back in.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Form {...loginForm}>
                                        <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-8">
                                            
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Email" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            You will be sent a confirmation email.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit">Submit</Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                :
                <div className="grid place-content-center gap-3">
                    <p className="text-xl font-semibold">You are currently Logged in</p>
                    <Button onClick={() => navigate("/" + bentoId)}>View Bento</Button>
                </div>
                }
            </div>
            <div id="detail">
                <Outlet />
            </div>
        </>)
}
export default Landing;
