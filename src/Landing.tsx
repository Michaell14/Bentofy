import { Outlet, Link, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast";

function Landing() {

    const { toast } = useToast()
    const supabase = useSupabaseClient();
    const user = useUser();
    const [ bentoId, setBentoId ] = useState("");
    const [ email, setEmail ] = useState("");

    useEffect(() => {
        async function getBentoId() {
            if (user) {
                let { data, error } = await supabase
                .from('Table')
                .select('bentoId').eq("user_id", user.id)
                console.log(data);
                if (data) {
                    setBentoId(data[0].bentoId);
                }
            }
        }
        getBentoId()
        
    }, [user])

    async function loginUser() {
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
              emailRedirectTo: 'https://www.youtube.com/'
            }
        })

        if (!error) {
            toast({
                title: "Check your email",
                description: "Check your email for a one time link. You may need to check your spam.",
            })
        }
    }
    
    return (
    <>
        <div className="grid grid-cols-1 h-full gap-4 place-content-center">
            <p className="font-mono text-4xl font-extrabold">Bento-fy Landing Page</p>
            <p className="text-slate-500">Sign In to bento-fy your life</p>
            
            <div className="flex place-content-center">
            <Tabs defaultValue="account" className="w-[420px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="Sign Up">Sign Up</TabsTrigger>
                    <TabsTrigger value="Log in">Log In</TabsTrigger>
                </TabsList>
                <TabsContent value="Sign Up">
                    <Card>
                    <CardHeader>
                        <CardTitle>Log in</CardTitle>
                        <CardDescription>
                        Make changes to your account here. Click save when you're done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         <div className="space-y-1 flex place-content-center">
                            <Label className="mt-1 text-2xl fotn-mono font-bold" htmlFor="id">Bentofy.me/</Label>
                            <Input id="id" className="grid col-span-1 w-36" type="text" placeholder="BentoId" disabled={user!==null} value={bentoId} 
                            onChange={(e) => setBentoId(e.target.value)}/>
                        </div>
                        <div className="space-y-1">
                            <Login bentoId={bentoId}/>
                        </div>
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
                        <div className="space-y-1">
                        <Label htmlFor="current">Email</Label>
                        <Input id="current" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={loginUser}>Log In</Button>
                    </CardFooter>
                    </Card>
                </TabsContent>
                </Tabs>
            </div>

        </div>
        <div id="detail">
            <Outlet />
        </div>
    </>)
}
export default Landing;
