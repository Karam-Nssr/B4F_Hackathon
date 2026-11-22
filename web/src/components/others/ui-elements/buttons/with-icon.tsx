import { Button } from "@/components/ui/button";
import { BoxIcon } from "@/icons";

const ButtonsWithIcon = () => {
  return (
    <div className="flex items-center gap-4">
      <Button>
        <BoxIcon /> <span>Button Text</span>
      </Button>
      <Button variant="outline">
        <span>Button Text</span>
        <BoxIcon />
      </Button>
      <Button variant="outline" size="icon">
        <BoxIcon />
      </Button>
    </div>
  );
};

export default ButtonsWithIcon;
