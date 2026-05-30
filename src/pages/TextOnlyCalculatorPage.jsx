import { useParams } from "react-router-dom";
import GenericCalculatorPage from "./GenericCalculatorPage.jsx";
import SalaryTakeHomePage from "./SalaryTakeHomePage.jsx";
import WorkdayPage from "./WorkdayPage.jsx";

export default function TextOnlyCalculatorPage() {
  const { calculatorId } = useParams();

  if (calculatorId === "workday") {
    return <WorkdayPage />;
  }

  if (calculatorId === "salary-take-home") {
    return <SalaryTakeHomePage />;
  }

  return <GenericCalculatorPage />;
}
