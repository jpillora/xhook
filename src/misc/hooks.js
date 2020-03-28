import { EventEmitter } from "./event-emitter";

//global set of hook functions,
//uses event emitter to store hooks
const hooks = EventEmitter(true);

export default hooks;
