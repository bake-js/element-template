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
import component from "../bill/component";
import style from "../bill/style";
import SupportText from "../bill/supportText";

@define("o-id-number-of-people")
@paint(component, style)
class NumberOfPeople extends Echo(HTMLElement) {
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
    return "numberOfPeople";
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
    return "Number of People";
  }

  get [trait.min]() {
    return 1;
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
      this.#supportText.set("Number of people is required");
      return this;
    }

    if (f.lt(this, this[trait.min])) {
      this.#internals.states.add("invalid");
      this.#supportText.set(
        `Number of people cannot be less than ${this[trait.min]}`,
      );
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
      min: 0,
      max: 100,
      scale: 0,
      signed: false,
      thousandsSeparator: "",
      padFractionalZeros: false,
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

export default NumberOfPeople;
