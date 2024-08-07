import { define } from "@bake-js/element";
import { paint } from "@bake-js/element/dom";
import Echo from "@bake-js/element/echo";
import on from "@bake-js/element/event";
import trait from "standard/trait";
import component from "./component";
import style from "./style";

@define("xyz-invite")
@paint(component, style)
class Invite extends Echo(HTMLElement) {
  #invites;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  @on.added("xyz-add-invite")
  [trait.addInvite](event) {
    return this;
  }
}

export default Invite;
