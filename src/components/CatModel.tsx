import { useEffect, useState, useRef } from "react";
import { Illustration, useRender, useInvalidate, Box } from 'react-zdog';


// RotatingCube Component
const RotatingCube = () => {
    const boxRef = useRef();
    
    // Use the useRender hook to continuously update the rotation
    useRender(() => {
    if (boxRef.current) {
        //boxRef.current.rotate.x += 0.01;
        boxRef.current.rotate.y += 0.01;
        }
    });
    
    return (
        <Box
            ref={boxRef}
            width={50}
            height={50}
            depth={50}
            color="#E44"
            leftFace="#4E4"
            rightFace="#44E"
            topFace="#EE4"
            bottomFace="#4EE"
            rotate={{y: -Math.PI*2/3}}
        />
    );
    
};

function CatModel() {


    return (
    <>
        <Illustration zoom={4}>
            <RotatingCube />
        </Illustration>
    </>
  )
}

export default CatModel;
