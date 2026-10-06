export default function Badge({ value }) {
  return <span className={`badge ${value}`}>{value.replace('_', ' ').toLowerCase()}</span>;
}
