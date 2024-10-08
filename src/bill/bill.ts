import {
  define,
  disconnected,
  formAssociated,
  formReset,
} from "@bake-js/-o-id";
import { didPaint, paint } from "@bake-js/-o-id/dom";
import Echo from "@bake-js/-o-id/echo";
import on, { prevent } from "@bake-js/-o-id/event";
import IMask from "artifact/imask";
import __ from "standard/dunder";
import * as f from "standard/f";
import joinCut from "standard/joinCut";
import trait from "standard/trait";
import component from "./component";
import style from "./style";
import SupportText from "./supportText";

@define("o-id-bill")
@paint(component, style)
class Bill extends Echo(HTMLElement) {
  #controller;
  #internals;
  #mask;
  #supportText;
  #value;

  get form() {
    return this.#internals.form;
  }

  get inputMode() {
    return "numeric";
  }

  get name() {
    return "bill";
  }

  get type() {
    return "text";
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }

  get validity() {
    return this.#internals.validity;
  }

  get value() {
    return (this.#value ??= "");
  }

  set value(value) {
    this.#value = value;
    this.shadowRoot.querySelector("input").value = value;
    this.dispatchEvent(new CustomEvent("changed", { detail: value }));
  }

  get willValidate() {
    return this.#internals.willValidate;
  }

  get [trait.label]() {
    return "Bill";
  }

  get [trait.min]() {
    return 0;
  }

  static get formAssociated() {
    return true;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals();
    this.#controller = new AbortController();
    this.#supportText = SupportText.from(this);
  }

  checkValidity() {
    return this.#internals.checkValidity();
  }

  reportValidity() {
    return this.#internals.reportValidity();
  }

  @on.input("input")
  @joinCut(trait.check)
  @joinCut(trait.setValidity)
  [trait.change](event) {
    this.value = event.target.value;
    return this;
  }

  @on.invalid("*", prevent)
  [trait.check](event) {
    if (f.isEmpty(this)) {
      this.#internals.states.add("invalid");
      this.#supportText.set("Bill is required");
      return this;
    }

    if (f.lt(this, this[trait.min])) {
      this.#internals.states.add("invalid");
      this.#supportText.set(`Bill cannot be less than ${this[trait.min]}`);
      return this;
    }

    this.#internals.states.delete("invalid");
    this.#supportText.remove();
    return this;
  }

  @didPaint
  [trait.mask]() {
    const element = this.shadowRoot.querySelector("input");
    const options = {
      mask: Number,
      scale: 2,
      signed: false,
      thousandsSeparator: ",",
      padFractionalZeros: true,
      normalizeZeros: true,
      radix: ".",
      mapToRadix: ["."],
      min: 0,
      max: 1000000,
    };

    this.#mask?.destroy();
    this.#mask = IMask(element, options);
    return this;
  }

  @disconnected
  [trait.remove]() {
    this.#controller.abort();
    this.#mask.destroy();
    return this;
  }

  @formReset
  @joinCut(trait.setValidity)
  [trait.reset]() {
    this.#internals.states.delete("invalid");
    this.#supportText.remove();
    this.value = "";
    return this;
  }

  @formAssociated
  [trait.setFormValue](form) {
    form.addEventListener(
      "formdata",
      (event) => event.formData.set(this.name, this.value),
      { signal: this.#controller.signal },
    );
    return this;
  }

  @didPaint
  [trait.setValidity]() {
    const { validationMessage, validity } =
      this.shadowRoot.querySelector("input");
    this.#internals.setValidity(validity, validationMessage);
    return this;
  }

  [__.isEmpty__]() {
    return this.value;
  }

  [__.lt__]() {
    return Number(this.value);
  }
}

export default Bill;
