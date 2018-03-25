import { AudioElement } from "../../models";

export interface AudioState {
    audio?: { [id: number]: AudioElement };
    error: boolean;
}
