import {
  muscleVolumes,
  recentWorkouts,
  weeklyMetrics,
} from '../model/workout-dashboard-data';
import styles from './workout-dashboard.module.css';

export function WorkoutDashboard() {
  return (
    <>
      <section className={styles.metrics} aria-label="주간 운동 요약">
        {weeklyMetrics.map((metric) => (
          <div key={metric.label} className={styles.metricItem}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="recent-workouts-title">
        <h2 id="recent-workouts-title" className={styles.sectionTitle}>
          최근 기록
        </h2>
        <div className={styles.workoutList}>
          {recentWorkouts.map((workout) => (
            <article key={workout.name} className={styles.workoutItem}>
              <div>
                <h3>{workout.name}</h3>
                <p>{workout.detail}</p>
              </div>
              <span>{workout.total}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="volume-title">
        <h2 id="volume-title" className={styles.sectionTitle}>
          부위별 볼륨
        </h2>
        <div className={styles.volumeList}>
          {muscleVolumes.map((volume) => (
            <div key={volume.label} className={styles.volumeRow}>
              <span>{volume.label}</span>
              <div className={styles.volumeTrack}>
                <div style={{ width: `${volume.value}%` }} />
              </div>
              <strong>{volume.value}%</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
