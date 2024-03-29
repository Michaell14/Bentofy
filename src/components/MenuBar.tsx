import { useState } from "react";
import {
  Menubar,
  MenubarMenu,
} from "@/components/ui/menubar"
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

interface itemable {
  header: string | null,
  body: string | null,
  width: number | null,
  height: number | null,
  type: string | null,
  size: number | null,
  id: number | null
}

function MenuBar({ editable/*, removable*/ }: { editable: boolean, removable: boolean }) {
  const { toast } = useToast()
  const user = useUser();
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [type, setType] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  function isValid() {
    let title = "Card Created."
    let desc = "Be creative with it!";
    let isError = false;
    if (height == null) {
      isError = true;
      desc = "Height is not selected.";
    } else if (width == null) {
      isError = true;
      desc = "Width is not selected.";
    } else if (type == null) {
      isError = true;
      desc = "Type is not selected.";
    }

    if (isError) {
      title = "Invalid Selection."
    }
    toast({
      title: title,
      description: desc,
    })

    return !isError;
  }

  async function createNode() {
    if (!isValid()) {
      return;
    }
    if (user) {

      let { data } = await supabase
        .from('Table')
        .select('blocks, galleries, texts').eq("user_id", user.id);

      if (data == null) {
        return;
      }

      let newItem : itemable = {
        width: width,
        height: height,
        type: type,
        header: null,
        size: null,
        id: null,
        body: null
      };

      let newGalleries = data[0].galleries;
      let newTexts = data[0].texts;
      if (type === "Text") {
        newItem["header"] = "";
        newItem["body"] = "";
        newItem["size"] = 30;

        if (height === 1) {
          newItem["size"] = 50;
        }

        if (data.length) {
          newItem["id"] = data[0].texts;
        } else {
          newItem["id"] = 0;
        }
        newTexts += 1;
      }
      else if (type === "Image") {
        newGalleries += 1;
        if (data.length) {
          newItem["id"] = newGalleries;
        } else {
          newItem["id"] = 0;
        }
      }

      if (data.length) {
        const newArr = [...data[0].blocks];
        newArr.push(newItem);
        await supabase
          .from("Table")
          .update({ blocks: newArr, galleries: newGalleries, texts: newTexts })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from('Table')
          .insert({ user_id: user.id, blocks: [newItem] });
      }
    }
  }

  async function toggleEditable() {
    if (!user) {
      return;
    }

    await supabase
      .from('Table')
      .update({ isEditable: !editable })
      .eq('user_id', user.id)
      .select();
  }

  /*
  async function toggleRemoveMode() {
    if (!user) {
      return;
    }

    await supabase
      .from('Table')
      .update({ isRemovable: !removable })
      .eq('user_id', user.id)
      .select()
  }*/

  return (
    <>
      <Menubar className="p-6 gap-2">
        <MenubarMenu>
          <Select onValueChange={(e) => setHeight(parseInt(e))}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Height" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Height</SelectLabel>
                <SelectItem value={"1"}>1</SelectItem>
                <SelectItem value={"2"}>2</SelectItem>
                <SelectItem value={"3"}>3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </MenubarMenu>
        x
        <MenubarMenu>
          <Select onValueChange={(e) => setWidth(parseInt(e))}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Width" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Width</SelectLabel>
                <SelectItem value={"1"}>1</SelectItem>
                <SelectItem value={"2"}>2</SelectItem>
                <SelectItem value={"3"}>3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </MenubarMenu>
        <MenubarMenu>
          <Select onValueChange={(e) => setType(e)}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Type</SelectLabel>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </MenubarMenu>
        <MenubarMenu>
          <Button onClick={createNode} disabled={!editable}>Create Card</Button>
        </MenubarMenu>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle variant="outline" aria-label="Toggle italic" pressed={editable} onClick={toggleEditable}>
                <Pencil2Icon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Edit Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/*}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger>
              <Toggle variant="outline" aria-label="Toggle italic" pressed={removable} onClick={toggleRemoveMode}>
                <TrashIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Remove Mode</p>
            </TooltipContent>
          </Tooltip>
  </TooltipProvider>*/}

      </Menubar>

    </>
  )
}

export default MenuBar;
