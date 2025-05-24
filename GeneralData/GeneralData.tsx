import { ImageSourcePropType } from "react-native";

export const QuickActionData = [
    {
        id: 1,
        name: "schools",
        label: "Écoles",
        img: require("../assets/images/static-images/SchoolIcon.png"),
        route: "/schools",
    },
    {
        id: 2,
        name: "childrens",
        label: "Enfants",
        img: require("../assets/images/static-images/StudentsGroupIcon.png"),
        route: "/childrens",
    },
    {
        id: 3,
        name: "merchandises",
        label: "Marchandises",
        img: require("../assets/images/static-images/MerchandiseIcon.png"),
        route: "/merchandises",
    },
    {
        id: 4,
        name: "payment-history",
        label: "Historique des paiements",
        img: require("../assets/images/static-images/TransactionHistoryIcon.png"),
        route: "/paymenthistory",
    },

]

export interface QuickActionItem {
    id: number;
    name: string;
    label: string;
    img: ImageSourcePropType;
    route: string;
}