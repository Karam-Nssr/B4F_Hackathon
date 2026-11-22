import ComponentCard from "@/components/common/component-card";
import ComboboxSelectInput from "./combobox-select-input";
import MultipleSelectInput from "./multiple-select-input";
import SelectInput from "./select-input";

const SelectInputs = () => {
  return (
    <ComponentCard title="Select Inputs">
      <div className="space-y-6">
        <SelectInput />
        <MultipleSelectInput />
        <ComboboxSelectInput />
      </div>
    </ComponentCard>
  );
};

export default SelectInputs;
