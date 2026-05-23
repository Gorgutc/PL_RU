'use client';

import { Card, Elevation, Button } from '@blueprintjs/core';
import styles from './ExampleCard.module.scss';

type ExampleCardProps = {
  title: string;
  body: string;
  ctaLabel?: string;
};

export function ExampleCard({ title, body, ctaLabel = 'Action' }: ExampleCardProps) {
  return (
    <Card elevation={Elevation.TWO} className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <Button intent="primary" className={styles.cta}>
        {ctaLabel}
      </Button>
    </Card>
  );
}
