import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

function Login( { bentoId } : {bentoId : string} ) {
    const { toast } = useToast()
    const user = useUser();
    const supabase = useSupabaseClient();
    const navigate = useNavigate();
    const [ email, setEmail ] = useState("");

    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)
    
      if (event === 'SIGNED_IN') {
        console.log("signed in");
        console.log(user);
        createNode();
      }
    })
    
    async function createNode() {
      if (!user) {
        return;
      }
      await supabase
        .from('Table')
        .insert({ user_id: user.id, blocks: [], bentoId: localStorage.getItem("bentoId") })
    }

    async function signUpNewUser() {
      console.log(bentoId);
      if (!bentoId.length) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: "Please enter a bento ID",
          variant: "destructive"
        })
        return;
      } else {
        let { data, error } = await supabase
        .from('Table')
        .select('bentoId').eq("bentoId", bentoId);
        
        if (data && data.length > 0) {
          toast({
            title: "Oops, someone took your favorite id.",
            description: "This already exists too bad so sad.",
          })
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: 'https://www.youtube.com/'
        }
      })

      if (error) {
        toast({
          title: "ERROR.",
          description: error.message,
        })
      } else {
        toast({
          title: "Check your email",
          description: "Check your email for a one time link. You may need to check your spam.",
        })
        localStorage.setItem("bentoId", bentoId);
      }
    }

    async function signOutUser() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log(error);
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        })
        navigate("/");
      }
    }

    async function navigateBento() {
      navigate("/" + bentoId);
    }
      
    return (
    <>
        { user === null ? 
        <>
          <div className="flex gap-2">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
            <Button onClick = {signUpNewUser}>Sign In</Button>
          </div>
        </>
        :
          <div className="flex gap-2">
            <Button onClick={navigateBento}>View Bento</Button>
            <Button variant={"outline"} onClick = {signOutUser}>Log Out</Button>
          </div>
        }
    </>
  )
}

export default Login;
