import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

interface FightHistory {
  id: string;
  date: string;
  opponent: string;
  originalMessage: string;
  usedResponse: string;
  outcome: 'victory' | 'defeat' | 'ongoing';
  score: number;
}

const HistoryScreen: React.FC = () => {
  // Demo data for fight history
  const fightHistory: FightHistory[] = [
    {
      id: '1',
      date: '2024-01-15',
      opponent: 'Sarah K.',
      originalMessage: 'Can we reschedule our meeting?',
      usedResponse: 'Of course! When works better for you? I have flexibility this week.',
      outcome: 'victory',
      score: 95
    },
    {
      id: '2',
      date: '2024-01-14',
      opponent: 'Mike T.',
      originalMessage: 'Your proposal is too expensive.',
      usedResponse: 'I understand your concern. Let me show you the value breakdown and ROI.',
      outcome: 'victory',
      score: 88
    },
    {
      id: '3',
      date: '2024-01-13',
      opponent: 'Jenny L.',
      originalMessage: 'I think you misunderstood what I meant.',
      usedResponse: 'You\'re right, could you help me understand your perspective better?',
      outcome: 'ongoing',
      score: 72
    },
    {
      id: '4',
      date: '2024-01-12',
      opponent: 'Alex R.',
      originalMessage: 'This deadline is impossible.',
      usedResponse: 'I hear you. What if we break it into smaller milestones?',
      outcome: 'victory',
      score: 91
    },
    {
      id: '5',
      date: '2024-01-11',
      opponent: 'Boss',
      originalMessage: 'We need to talk about your performance.',
      usedResponse: 'I appreciate the feedback. Could we schedule time to discuss specifics?',
      outcome: 'defeat',
      score: 45
    },
  ];

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'victory': return '#28a745';
      case 'defeat': return '#dc3545';
      case 'ongoing': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'victory': return '🏆';
      case 'defeat': return '💀';
      case 'ongoing': return '⚔️';
      default: return '❓';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.headerTitle}>⚔️ Battle History</Text>
        <Text style={styles.headerSubtitle}>Your conversation victories and defeats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {fightHistory.filter(f => f.outcome === 'victory').length}
            </Text>
            <Text style={styles.statLabel}>Victories</Text>
            <Text style={styles.statIcon}>🏆</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {fightHistory.filter(f => f.outcome === 'defeat').length}
            </Text>
            <Text style={styles.statLabel}>Defeats</Text>
            <Text style={styles.statIcon}>💀</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(fightHistory.reduce((acc, f) => acc + f.score, 0) / fightHistory.length)}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
            <Text style={styles.statIcon}>📊</Text>
          </View>
        </View>
      </View>

      {/* Fight History List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📜 Recent Battles</Text>
        
        {fightHistory.map((fight) => (
          <TouchableOpacity key={fight.id} style={styles.fightCard}>
            <View style={styles.fightHeader}>
              <View style={styles.fightInfo}>
                <Text style={styles.opponent}>{fight.opponent}</Text>
                <Text style={styles.date}>{new Date(fight.date).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.outcomeContainer}>
                <View style={[styles.outcomeBadge, { backgroundColor: getOutcomeColor(fight.outcome) }]}>
                  <Text style={styles.outcomeIcon}>{getOutcomeIcon(fight.outcome)}</Text>
                  <Text style={styles.outcomeText}>{fight.outcome.toUpperCase()}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.score, { color: getScoreColor(fight.score) }]}>
                    {fight.score}
                  </Text>
                  <Text style={styles.scoreLabel}>pts</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Original Message:</Text>
              <Text style={styles.originalMessage}>"{fight.originalMessage}"</Text>
            </View>
            
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Your Response:</Text>
              <Text style={styles.usedResponse}>"{fight.usedResponse}"</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Battle Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Battle Insights</Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tip}>• Most victories come from empathetic responses</Text>
          <Text style={styles.tip}>• Questions outperform statements 3:1</Text>
          <Text style={styles.tip}>• Acknowledge before redirecting</Text>
          <Text style={styles.tip}>• Timing matters - respond thoughtfully</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  statIcon: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  fightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  fightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fightInfo: {
    flex: 1,
  },
  opponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6c757d',
  },
  outcomeContainer: {
    alignItems: 'flex-end',
  },
  outcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  outcomeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginLeft: 2,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  originalMessage: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  responseContainer: {
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  usedResponse: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  tip: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HistoryScreen; 