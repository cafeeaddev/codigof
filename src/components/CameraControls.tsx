import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraControlsProps {
  position: [number, number, number];
  fov: number;
  onPositionChange: (position: [number, number, number]) => void;
  onFovChange: (fov: number) => void;
}

export const CameraControls = ({ position, fov, onPositionChange, onFovChange }: CameraControlsProps) => {
  const [x, y, z] = position;

  const copyConfig = () => {
    const config = `position: [${x}, ${y}, ${z}], fov: ${fov}`;
    navigator.clipboard.writeText(config);
    console.log('Camera config copied:', config);
  };

  return (
    <Card className="fixed top-4 left-4 z-50 p-4 w-80 bg-background/90 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">Camera Controls</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Position X: {x.toFixed(2)}</label>
          <Slider
            value={[x]}
            onValueChange={([value]) => onPositionChange([value, y, z])}
            min={-10}
            max={10}
            step={0.1}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Position Y: {y.toFixed(2)}</label>
          <Slider
            value={[y]}
            onValueChange={([value]) => onPositionChange([x, value, z])}
            min={-5}
            max={15}
            step={0.1}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Position Z: {z.toFixed(2)}</label>
          <Slider
            value={[z]}
            onValueChange={([value]) => onPositionChange([x, y, value])}
            min={-10}
            max={10}
            step={0.1}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">FOV: {fov.toFixed(0)}</label>
          <Slider
            value={[fov]}
            onValueChange={([value]) => onFovChange(value)}
            min={30}
            max={120}
            step={1}
            className="mt-1"
          />
        </div>
        
        <Button onClick={copyConfig} className="w-full">
          Copy Camera Config
        </Button>
      </div>
    </Card>
  );
};