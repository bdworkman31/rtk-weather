import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

import type { WeatherChart } from "../store/slices/weatherSlice";
import styles from "../page.module.css";

type WeatherChartsProps = {
  charts: WeatherChart[];
};

export default function WeatherCharts({ charts }: WeatherChartsProps) {
  if (charts.length === 0) {
    return null;
  }

  return (
    <section className={styles.weatherTable}>
      <div className={styles.columnNameContainer}>
        <div>City</div>
        <div>Temperature</div>
        <div>Humidity</div>
        <div>Pressure</div>
      </div>

      {charts.map((chart) => (
        <article key={chart.city} className={styles.weatherContainer}>
          <div className={`${styles.card} ${styles.cityCard}`}>
            <h2 className={styles.cityName}>{chart.city}</h2>
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <Sparklines data={chart.temps}>
              <SparklinesLine color="#f59e0b" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>

            <p>{chart.meanTemp}°F</p>
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <Sparklines data={chart.humidity}>
              <SparklinesLine color="#38bdf8" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>

            <p>{chart.meanHumidity}%</p>
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <Sparklines data={chart.pressure}>
              <SparklinesLine color="#a78bfa" />
              <SparklinesReferenceLine type="mean" />
            </Sparklines>

            <p>{chart.meanPressure} hPa</p>
          </div>
        </article>
      ))}
    </section>
  );
}
