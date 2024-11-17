export class InputValueBase {
    constructor(value, onChange) {
        this.value = value;
        this.onChange = onChange;
    }

    onChangeIfDefined = () => {
        if (this.onChange) this.onChange();
    };
}
