import { VscodeFormGroup, VscodeLabel } from "hds-react";

interface FormFieldWrapperProps {
    label: string;
    children: React.ReactNode;
    showLabel?: boolean;
}

export function FormFieldWrapper({ label, children, showLabel = true }: FormFieldWrapperProps) {
    return (
        <VscodeFormGroup variant="settings-group">
            {showLabel && <VscodeLabel>{label}</VscodeLabel>}
            {children}
        </VscodeFormGroup>
    );
}

