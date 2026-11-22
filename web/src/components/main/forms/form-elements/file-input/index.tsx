import ComponentCard from "@/components/common/component-card";
import DefaultFileInput from "./default-file-input";

const FileInput = () => {
  return (
    <ComponentCard title="File Input">
      <div className="space-y-6">
        <DefaultFileInput />
      </div>
    </ComponentCard>
  );
};

export default FileInput;
