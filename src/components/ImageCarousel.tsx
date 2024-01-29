import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input"
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useRef } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";
import { UploadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"


function ImageCarousel( { card, editable, /*removable,*/ bentoId, userId } : 
    { card: any, editable : boolean, removable : boolean, bentoId: string, userId: string}) {

    const supabase = useSupabaseClient();
    const user = useUser();
    const plugin = useRef(
        Autoplay({ delay: 2200, stopOnInteraction: true })
    )
    const [ images, setImages ] = useState<string[]>([]);

    useEffect(() => {
        getImages();
    }, [])

    //Retrieves the images for this card
    async function getImages() {
        if (!card || !("id" in card)) {
            return;
        }

        const { data } = await supabase.storage.from('images')
            .list(bentoId + "/" + card["id"], {
            limit: 10,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        })

        if (data !== null) {
            let imgs: string[] = [];
            for (let i = 0; i < data.length; i++) {
                imgs.push("https://ilfitxqmjmmbyztfgujy.supabase.co/storage/v1/object/public/images/" + bentoId + "/" + card.id + "/" + data[i].name);
            }
            setImages(imgs);
        }
    }

    async function uploadImage(e: any) {
        let file = e.target.files[0];
        const { data, error } = await supabase.storage.from("images").upload(bentoId + "/" + card.id + "/" + uuidv4(), file);

        if (data) {
            getImages();
        } else {
            console.log(error);
        }
    }

    return (
    <>  
        <Carousel className="min-w-[200px]" opts={{ align: "start" }}
            orientation="vertical"
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            style={{gridRow: `span ${card["height"]} / span ${card["height"]}`, 
            gridColumn: `span ${card["width"]} / span ${card["width"]}`}}>

            <CarouselContent className={`-mt-1 
            ${card["height"]===3 ? "h-[554px]" : card["height"]===1 ? "h-[174px]" : "h-[364px]"}`}>
                {(images && images.length) ? images.map((image, index) => (
                    <CarouselItem className="pt-1 md:basis-1" key={index}>
                        <div className="p-0">
                            <Card>
                                <CardContent className="flex items-center justify-center p-3 pt-1 rounded-xl">
                                    <div className="mt-2">
                                        <img
                                            src={image}
                                            alt="Preview"
                                            className="rounded-md"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                )) : (
                    <>
                        <div className="mt-1 bg-slate-100 h-full rounded-xl grid place-content-center font-mono">{(editable && user) && ("No Image Selected.")}</div>
                        
                    </>
                )}
            </CarouselContent>

            {/*(removable && user && user.id===userId) && 
                <div className="grid w-full items-center mt-1">
                    <div className="image-upload absolute top-3 left-3">
                            
                            <Button variant="outline" size={"icon"}>
                                <TrashIcon/>
                            </Button>
                        </div>
                </div>
                */}
            {(editable && user && user.id===userId) &&  
                <div className="grid w-full items-center mt-1">
                    <div className="image-upload absolute top-3 right-3">
                            
                            <Button variant="outline" size={"icon"}>
                                <label htmlFor={card.id}>
                                <UploadIcon/>
                                </label>
                            </Button>
                        <Input id={card.id} className="hover:cursor-pointer hidden" type="file" accept="image/png, image/jpg, image/jpeg" onChange={uploadImage}/>
                    </div>
                </div>
            }
        </Carousel>
    </>)
}
export default ImageCarousel;
