import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCallback } from "react";

interface CameraControlsProps {
  position: [number, number, number];
  fov: number;
  onPositionChange: (position: [number, number, number]) => void;
  onFovChange: (fov: number) => void;
}

export const CameraControls = ({ position, fov, onPositionChange, onFovChange }: CameraControlsProps) => {
  const [x, y, z] = position;

  const handleXChange = useCallback(([value]: number[]) => {
    console.log('X changed to:', value);
    onPositionChange([value, y, z]);
  }, [y, z, onPositionChange]);

  const handleYChange = useCallback(([value]: number[]) => {
    console.log('Y changed to:', value);
    onPositionChange([x, value, z]);
  }, [x, z, onPositionChange]);

  const handleZChange = useCallback(([value]: number[]) => {
    console.log('Z changed to:', value);
    onPositionChange([x, y, value]);
  }, [x, y, onPositionChange]);

  const handleFovChange = useCallback(([value]: number[]) => {
    console.log('FOV changed to:', value);
    onFovChange(value);
  }, [onFovChange]);

  const copyConfig = () => {
    const config = `position: [${x}, ${y}, ${z}], fov: ${fov}`;
    navigator.clipboard.writeText(config);
    console.log('Camera config copied:', config);
  };

  return (
    <Card className="fixed top-4 left-4 z-[9999] p-4 w-80 bg-background/95 backdrop-blur-sm border shadow-lg pointer-events-auto">
      <h3 className="text-lg font-semibold mb-4">Camera Controls</h3>
      
      <div className="space-y-4">
        <div key="pos-x">
          <label className="text-sm font-medium">Position X: {x.toFixed(2)}</label>
          <Slider
            key={`slider-x-${x}`}
            value={[x]}
            defaultValue={[x]}
            onValueChange={handleXChange}
            min={-10}
            max={10}
            step={0.1}
            className="mt-1 pointer-events-auto"
          />
        </div>
        
        <div key="pos-y">
          <label className="text-sm font-medium">Position Y: {y.toFixed(2)}</label>
          <Slider
            key={`slider-y-${y}`}
            value={[y]}
            defaultValue={[y]}
            onValueChange={handleYChange}
            min={-5}
            max={15}
            step={0.1}
            className="mt-1 pointer-events-auto"
          />
        </div>
        
        <div key="pos-z">
          <label className="text-sm font-medium">Position Z: {z.toFixed(2)}</label>
          <Slider
            key={`slider-z-${z}`}
            value={[z]}
            defaultValue={[z]}
            onValueChange={handleZChange}
            min={-10}
            max={10}
            step={0.1}
            className="mt-1 pointer-events-auto"
          />
        </div>
        
        <div key="fov">
          <label className="text-sm font-medium">FOV: {fov.toFixed(0)}</label>
          <Slider
            key={`slider-fov-${fov}`}
            value={[fov]}
            defaultValue={[fov]}
            onValueChange={handleFovChange}
            min={30}
            max={120}
            step={1}
            className="mt-1 pointer-events-auto"
          />
        </div>
        
        <Button onClick={copyConfig} className="w-full">
          Copy Camera Config
        </Button>
      </div>
    </Card>
  );
};