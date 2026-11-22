import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const DefaultTextarea = () => {
  return (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <Textarea placeholder="Enter a description..." rows={6} />
    </Field>
  );
};

export default DefaultTextarea;
