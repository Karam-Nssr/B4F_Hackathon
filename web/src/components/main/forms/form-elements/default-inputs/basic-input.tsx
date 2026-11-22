import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const BasicInput = () => {
  return (
    <Field>
      <FieldLabel>Input</FieldLabel>
      <Input type="text" />
    </Field>
  );
};

export default BasicInput;
