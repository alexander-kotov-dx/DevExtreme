import $ from "../../../core/renderer";
import CustomButton from "./custom";
import { extend } from "../../../core/utils/extend";
import { find } from "../../../core/utils/array";

const TEXTEDITOR_BUTTONS_CONTAINER_CLASS = "dx-texteditor-buttons-container";

export default class ActionButtonCollection {
    constructor(editor, defaultButtonsInfo) {
        this.buttons = [];
        this.defaultButtonsInfo = defaultButtonsInfo;
        this.editor = editor;
    }

    _compileButtonInfo(buttons) {
        return buttons.map((button) => {
            const isDefaultButton = typeof button === "string";

            if(isDefaultButton) {
                const defaultButtonInfo = find(this.defaultButtonsInfo, ({ name }) => name === button);

                if(!defaultButtonInfo) {
                    throw "Unknown default button";
                }

                return defaultButtonInfo;
            } else {
                return extend(button, { Ctor: CustomButton });
            }
        });
    }

    _createButton(buttonsInfo) {
        const { Ctor, options, name } = buttonsInfo;
        const button = new Ctor(name, this.editor, options);

        this.buttons.push(button);

        return button;
    }

    _getLocation(buttonInfo) {
        return buttonInfo.Ctor.location;
    }

    _renderButtons(buttons, $container, targetLocation) {
        let $buttonsContainer = null;
        const buttonsInfo = buttons ? this._compileButtonInfo(buttons) : this.defaultButtonsInfo;
        const getButtonsContainer = () => {
            $buttonsContainer = $buttonsContainer || $("<div>")
                .addClass(TEXTEDITOR_BUTTONS_CONTAINER_CLASS)
                .appendTo($container);

            return $buttonsContainer;
        };

        buttonsInfo.forEach((buttonsInfo) => {
            const { location = "after" } = buttonsInfo;

            if(location === targetLocation) {
                this._createButton(buttonsInfo)
                    .render(getButtonsContainer());
            }
        });

        return $buttonsContainer;
    }

    clean() {
        this.buttons.forEach(button => button.dispose());
        this.buttons = [];
    }

    getButton(buttonName) {
        const button = find(this.buttons, ({ name }) => name === buttonName);

        if(!button) {
            throw "Cannot find button with this name";
        }

        return button.instance;
    }

    renderAfterButtons(buttons, $container) {
        return this._renderButtons(buttons, $container, "after");
    }

    renderBeforeButtons(buttons, $container) {
        return this._renderButtons(buttons, $container, "before");
    }

    updateButtons(names) {
        this.buttons.forEach(button => {
            if(!names || names.indexOf(button.name) !== -1) {
                button.update();
            }
        });
    }
}
