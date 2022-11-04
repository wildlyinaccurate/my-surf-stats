import date from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

date.extend(weekOfYear);

export default date;
