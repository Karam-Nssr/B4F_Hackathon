"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";

const DefaultFileInput = () => {
  return (
    <Field>
      <FieldLabel>Upload file</FieldLabel>
      <FileInput />
    </Field>
  );
};

export default DefaultFileInput;
