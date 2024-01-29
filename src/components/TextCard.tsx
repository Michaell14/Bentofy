import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon } from '@radix-ui/react-icons';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface cardable {
  id: number,
  body: string,
  header: string,
  size: number
}

function TextCard({ card, editable, /*removable,*/ bentoId, userId }: { card: cardable, editable: boolean, removable: boolean, bentoId: string, userId: string }) {

  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [size, setSize] = useState(30);
  const [isDragged, setIsDragged] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  async function updateCard() {
    if (!user) {
      return;
    }

    let { data } = await supabase
      .from('Table')
      .select('blocks, texts').eq("bentoId", bentoId);

    if (!data || !data[0]) {
      return;

    }
    const oldMessage = data[0].blocks;

    for (var i = 0; i < oldMessage.length; i++) {
      // look for the entry with a matching `code` value
      if (oldMessage[i].id == card.id && oldMessage[i].type === "Text") {
        oldMessage[i].header = header;
        oldMessage[i].body = body;
        oldMessage[i].size = size;
        setIsChanged(false);
        break;
      }
    }
    await supabase
      .from("Table")
      .update({ blocks: oldMessage })
      .eq("bentoId", bentoId);
  }

  useEffect(() => {
    if (card) {
      setBody(card.body);
      setHeader(card.header);
    }
  }, [card])

  useEffect(() => {
    if (isDragged) {
      setIsChanged(true);
    }
  }, [isDragged])

  return (
    <>
      {(card && ("height" in card) && ("width" in card)) ?
        <div style={{ gridRow: `span ${card["height"]} / span ${card["height"]}`, gridColumn: `span ${card["width"]} / span ${card["width"]}` }} className={"bg-slate-100 relative rounded-xl min-w-[200px]"}>
          <ResizablePanelGroup
            direction="vertical"
            className={"rounded-lg border " + (card["height"] === 1 ? "h-[300px]" : card["height"] === 2 ? "h-[408px]" : "h-[617px]")}
          >
            <ResizablePanel defaultSize={Number(card.size)} onResize={(e) => setSize(e)}>
              <div className="flex h-full items-center justify-center p-2">
                <Textarea className={"h-[100%] resize-none font-semibold"} disabled={!editable || (user !== null && user.id !== userId)} placeholder={editable ? "Type your header here." : ""} value={header} onChange={(e) => { setIsChanged(true); setHeader(e.target.value) }} />
              </div>
            </ResizablePanel>
            {editable && <ResizableHandle withHandle={editable && user !== null && user.id === userId} disabled={!editable || (user !== null && user.id !== userId)} onDragging={(e) => setIsDragged(e)} />}
            <ResizablePanel defaultSize={100 - Number(card.size)}>
              <div className={"flex h-full items-center justify-center p-2 " + (isChanged && "pb-1")}>
                <Textarea className={"h-[100%] resize-none"} disabled={(!editable || (user !== null && user.id !== userId))} placeholder={editable ? "Type your body here." : ""} value={body} onChange={(e) => { setBody(e.target.value); setIsChanged(true) }} />
              </div>
            </ResizablePanel>

            {(isChanged && editable && user && user.id === userId) &&
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="absolute bottom-0 w-[calc(100%-1rem)] ml-[.5rem] mb-1 h-5" variant="outline" onClick={updateCard}>
                      <CheckIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confirm Changes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>}

          </ResizablePanelGroup>

        </div>
        :
        <>
          <p>There is an error with loading the page</p>
        </>
      }
    </>
  )
}

export default TextCard;
