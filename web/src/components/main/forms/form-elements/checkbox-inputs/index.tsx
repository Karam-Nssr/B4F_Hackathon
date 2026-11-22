import ComponentCard from "@/components/common/component-card";
import DefaultCheckbox from "./default-checkbox";
import LabeledCheckbox from "./labeled-checkbox";

const CheckboxInputs = () => {
  return (
    <ComponentCard title="Checkboxes">
      <div className="space-y-6">
        <DefaultCheckbox />
        <LabeledCheckbox />
      </div>
    </ComponentCard>
  );
};

export default CheckboxInputs;
