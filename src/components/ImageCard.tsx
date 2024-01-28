import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast";


function ImageCard( {card: card} ) {
  
      
    return (
    <>
        <div style={{gridRow: `span ${card["height"]} / span ${card["height"]}`, gridColumn: `span ${card["width"]} / span ${card["width"]}`}} className={"bg-slate-200 rounded-lg"}>{card.type}</div>
    </>
  )
}

export default ImageCard;
