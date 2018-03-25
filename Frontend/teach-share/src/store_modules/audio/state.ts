import { AudioElement } from "../../models";

export interface AudioState {
    audio?: AudioElement[];
    error: boolean;
}
