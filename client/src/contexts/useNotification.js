import { useContext } from "react";
import { NotificationContext } from "./NotificationContextBase";

export const useNotification = () => useContext(NotificationContext);

