import React, { useEffect, useRef, useState } from 'react';
import '../../styles/landingLiveActivity.css';

const FIRST_NAMES = [
  'Rahul', 'Aman', 'Rohit', 'Arjun', 'Priya', 'Neha', 'Vishal', 'Ankit',
  'Aditya', 'Karan', 'Riya', 'Pooja', 'Akash', 'Saurabh', 'Deepak', 'Nikhil',
  'Varun', 'Harsh', 'Isha', 'Kavya', 'Manish', 'Suresh', 'Divya', 'Tanvi',
  'Yash', 'Mohit', 'Sneha', 'Ajay', 'Vikram', 'Rakesh', 'Sanjay', 'Meera',
  'Arun', 'Gaurav', 'Shivam', 'Naveen', 'Pankaj', 'Ritika', 'Anjali', 'Kunal',
];

const SURNAMES = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Khan', 'Gupta', 'Yadav', 'Reddy',
  'Malhotra', 'Joshi', 'Mehta', 'Chauhan', 'Rao', 'Nair', 'Das', 'Pillai',
];

const CITIES = [
  'Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Lucknow', 'Hyderabad', 'Bangalore',
  'Kolkata', 'Chennai', 'Surat', 'Ahmedabad', 'Indore', 'Bhopal', 'Nagpur',
  'Patna', 'Chandigarh', 'Kochi', 'Visakhapatnam', 'Coimbatore', 'Noida',
];

const SERVICES = [
  'Instagram Followers',
  'Instagram Likes',
  'Instagram Views',
  'Instagram Reels Views',
  'YouTube Subscribers',
  'YouTube Views',
  'Facebook Likes',
  'Telegram Members',
];

const FUND_AMOUNTS = [500, 1000, 2000, 5000, 10000, 15000];
const ORDER_QUANTITIES = [500, 1000, 2000, 2500, 5000, 10000, 15000, 20000];
const TIME_LABELS = ['Just now', '2 sec ago', '5 sec ago', '8 sec ago', '12 sec ago'];

const VISIBLE_MS = 5000;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatQty = (n) => n.toLocaleString('en-IN');

/** Random display name: first only, first + surname, or first + initial */
function randomName() {
  const first = pick(FIRST_NAMES);
  const roll = Math.random();
  if (roll < 0.4) return first;
  if (roll < 0.75) return `${first} ${pick(SURNAMES)}`;
  const initial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${first} ${initial}.`;
}

function buildActivity() {
  const name = randomName();
  const city = pick(CITIES);

  if (Math.random() < 0.28) {
    const amount = pick(FUND_AMOUNTS);
    const fundLine = Math.random() < 0.5
      ? `added ₹${formatQty(amount)} funds`
      : `added ₹${formatQty(amount)} wallet balance`;
    return {
      id: `${Date.now()}-${Math.random()}`,
      message: `${name} from ${city} ${fundLine}`,
    };
  }

  const qty = pick(ORDER_QUANTITIES);
  const service = pick(SERVICES);
  return {
    id: `${Date.now()}-${Math.random()}`,
    message: `${name} from ${city} just ordered ${formatQty(qty)} ${service}`,
  };
}

function buildUniqueActivity(lastMessage) {
  let next = buildActivity();
  let attempts = 0;
  while (next.message === lastMessage && attempts < 12) {
    next = buildActivity();
    attempts += 1;
  }
  return next;
}

const LandingLiveActivity = () => {
  const [activity, setActivity] = useState(null);
  const [timeLabel, setTimeLabel] = useState('Just now');
  const [visible, setVisible] = useState(false);
  const lastMessageRef = useRef('');

  useEffect(() => {
    let cancelled = false;
    const timers = [];

    const schedule = (fn, delay) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.push(id);
      return id;
    };

    const runCycle = () => {
      const next = buildUniqueActivity(lastMessageRef.current);
      lastMessageRef.current = next.message;
      setTimeLabel(pick(TIME_LABELS));
      setActivity(next);
      setVisible(true);

      schedule(() => {
        setVisible(false);
        schedule(runCycle, randomBetween(8000, 15000));
      }, VISIBLE_MS);
    };

    schedule(runCycle, randomBetween(2000, 4000));

    return () => {
      cancelled = true;
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <section
      className="landing-section landing-live-activity-section"
      aria-labelledby="landing-live-activity-title"
    >
      <div className="landing-section__container landing-live-activity-section__inner">
        <p className="landing-section__eyebrow">Live on panel</p>
        <h2 id="landing-live-activity-title" className="landing-section__title landing-live-activity-section__title">
          Abhi kaun order kar raha hai
        </h2>
        <p className="landing-live-activity-section__desc">
          Real-time style updates — random users placing orders across India.
        </p>

        <div className="landing-live-activity" aria-live="polite" aria-atomic="true">
          <div
            key={activity?.id || 'idle'}
            className={`landing-live-activity__card${visible && activity ? ' landing-live-activity__card--visible' : ''}`}
          >
            <div className="landing-live-activity__header">
              <span className="landing-live-activity__dot" aria-hidden="true" />
              <span className="landing-live-activity__title">🔥 Recent Activity</span>
            </div>
            <p className="landing-live-activity__message">
              {activity ? (
                <>
                  <span className="landing-live-activity__indicator" aria-hidden="true">🟢</span>
                  {activity.message}
                </>
              ) : (
                <span className="landing-live-activity__placeholder">Loading live updates…</span>
              )}
            </p>
            <span className="landing-live-activity__time">{activity ? timeLabel : '—'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingLiveActivity;
