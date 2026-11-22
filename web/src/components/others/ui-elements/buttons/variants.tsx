import { Button } from "@/components/ui/button";

const ButtonVariants = () => {
  return (
    <div className="space-x-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
};

export default ButtonVariants;
