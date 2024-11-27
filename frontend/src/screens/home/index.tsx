import React, { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import axios from 'axios';

interface Response {
    expr : string;
    result : string;
    assign : boolean;
}
interface GeneratedResult {
    expression : string;
    answer : string;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('white');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [dictOfVars, setDictOfvars] = useState({});

    useEffect(() => {
        if(reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if(canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = 2;
            }
        }
    }, []);

    const sendData =async () => {
        const canvas = canvasRef.current;
        if(canvas) {
            const response = await axios({
                method : 'post',
                url : `${import.meta.env.VITE_API_URL}/calculate`,
                data : {
                    image : canvas.toDataURL('image/png'),
                    dictOfVars : dictOfVars,
                }
            });

            const res = await response.data;
            console.log(res);

            
        }
    }
    const startDrawing = (e : React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.style.backgroundColor = 'black';
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    }

    const resetCanvas = () => {
        const canvas = canvasRef.current;

        if(canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.clearRect(0,0, canvas.width, canvas.height);
            }
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false);
    }

    const draw = ( e : React.MouseEvent<HTMLCanvasElement>) => {
        if(!isDrawing) {
            return;
        }

        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    } 
    return (
        <>
        <div className="grid grid-cols-3 gap-2">
            <Button
            onClick={() => setReset(true)}
            className="bg-red z-20 text-white"
            variant='default'
            color="red"
            >
                Reset
            </Button>
            <Group className="z-20">
                {SWATCHES.map((color : string) => (
                    <ColorSwatch
                    key={color}
                    color={color}
                    onClick={() => setColor(color)}
                    />
                )
            )}
            </Group>
            <Button
            onClick={sendData}
            className="bg-red z-20 text-white"
            variant='default'
            color="red"
            >
                Calculate
            </Button>
        </div>
        <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full "
        onMouseDown={startDrawing}
        onMouseOut={stopDrawing}    
        onMouseUp={stopDrawing}     
        onMouseMove={draw}
        />

        </>
    );
}