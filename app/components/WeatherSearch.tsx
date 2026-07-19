import styles from "../page.module.css";

type WeatherSearchProps = {
  city: string;
  onCityChange: (city: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSetDefault: () => void;
  onCurrentLocation: () => void;
};

export default function WeatherSearch({
  city,
  onCityChange,
  onSubmit,
  onSetDefault,
  onCurrentLocation,
}: WeatherSearchProps) {
  return (
    <>
      <form className={styles.searchContainer} onSubmit={onSubmit}>
        <input
          className={styles.searchInput}
          type="text"
          value={city}
          placeholder="Enter a city"
          onChange={(event) => onCityChange(event.target.value)}
        />

        <button className={styles.buttonClass} type="submit">
          Get Weather
        </button>

        <button
          className={styles.buttonClass}
          type="button"
          onClick={onSetDefault}
        >
          Set as Default
        </button>
      </form>

      <div className={styles.locationContainer}>
        <button
          className={styles.locationButton}
          type="button"
          onClick={onCurrentLocation}
        >
          Find Current Location
        </button>
      </div>
    </>
  );
}
