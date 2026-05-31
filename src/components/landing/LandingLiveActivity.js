import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../../styles/landingLiveActivity.css';

const NAMES = [
  'Rahul', 'Aman', 'Rohit', 'Arjun', 'Priya', 'Neha', 'Vishal', 'Ankit',
  'Aditya', 'Karan', 'Riya', 'Pooja', 'Akash', 'Saurabh',
];

const CITIES = [
  'Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Lucknow', 'Hyderabad', 'Bangalore',
  'Kolkata', 'Chennai', 'Surat',
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

function buildActivity() {
  const name = pick(NAMES);
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
    <div className="landing-live-activity" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {visible && activity && (
          <motion.div
            key={activity.id}
            className="landing-live-activity__card"
            initial={{ opacity: 0, x: -24, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -16, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-live-activity__header">
              <span className="landing-live-activity__dot" aria-hidden="true" />
              <span className="landing-live-activity__title">🔥 Recent Activity</span>
            </div>
            <p className="landing-live-activity__message">
              <span className="landing-live-activity__indicator" aria-hidden="true">🟢</span>
              {activity.message}
            </p>
            <span className="landing-live-activity__time">{timeLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingLiveActivity;
