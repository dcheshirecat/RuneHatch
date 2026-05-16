import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {REGIONS, PLAYER_STATS} from '../data/gameData';

const {width, height} = Dimensions.get('window');
const MAP_HEIGHT = height - 120;

function RegionNode({region, onPress, isSelected}: any) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1, duration: 1500, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 0, duration: 1500, useNativeDriver: true}),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={[styles.regionNode, {left: region.x * width - 20, top: region.y * MAP_HEIGHT - 20}]}
      onPress={() => !region.locked && onPress(region)}
      activeOpacity={region.locked ? 1 : 0.8}>
      {!region.locked && (
        <Animated.View style={[styles.nodePulse, {
          backgroundColor: region.color,
          opacity: pulseAnim.interpolate({inputRange: [0, 1], outputRange: [0.3, 0]}),
          transform: [{scale: pulseAnim.interpolate({inputRange: [0, 1], outputRange: [1, 2.2]})}],
        }]} />
      )}
      <View style={[styles.nodeCore, {
        borderColor: region.locked ? '#ffffff22' : region.color,
        opacity: region.locked ? 0.4 : 1,
      }]}>
        <Text style={styles.nodeIcon}>{region.locked ? '🔒' : '🥚'}</Text>
      </View>
      {isSelected && (
        <View style={[styles.nodeLabel, {borderColor: region.color + '44'}]}>
          <Text style={[styles.nodeLabelElement, {color: region.color}]}>{region.element}</Text>
          <Text style={styles.nodeLabelName}>{region.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MapScreen({navigation}: any) {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const panelAnim = useRef(new Animated.Value(0)).current;

  const handleRegionPress = (region: any) => {
    setSelectedRegion(region);
    Animated.spring(panelAnim, {toValue: 1, useNativeDriver: true, tension: 80, friction: 10}).start();
  };

  const panelY = panelAnim.interpolate({inputRange: [0, 1], outputRange: [200, 0]});

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0710" />
      <LinearGradient colors={['#1a0a2e', '#0a0710', '#0d1a2e']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Menu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ᚠ World of Runeveil ᚠ</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>🥚 {PLAYER_STATS.eggsCollected}</Text>
          <Text style={styles.statText}>⚔️ {PLAYER_STATS.battlesWon}</Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        {REGIONS.map(region => (
          <RegionNode
            key={region.id}
            region={region}
            onPress={handleRegionPress}
            isSelected={selectedRegion?.id === region.id}
          />
        ))}
      </View>

      {selectedRegion && (
        <Animated.View style={[styles.detailPanel, {transform: [{translateY: panelY}]}]}>
          <LinearGradient colors={['transparent', '#0a0710ee', '#0a0710']} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.panelContent}>
            <View style={styles.panelLeft}>
              <Text style={[styles.panelElement, {color: selectedRegion.color}]}>{selectedRegion.element} Region</Text>
              <Text style={styles.panelName}>{selectedRegion.name}</Text>
              <Text style={styles.panelDesc}>{selectedRegion.description}</Text>
              <Text style={styles.panelEggs}>🥚 {selectedRegion.eggs} eggs found</Text>
            </View>
            <View style={styles.panelRight}>
              <TouchableOpacity activeOpacity={0.8}>
                <LinearGradient colors={['#6a0dad', '#9b5de5']} style={styles.exploreBtn} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                  <Text style={styles.exploreBtnText}>EXPLORE</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedRegion(null)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0710'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff0f'},
  backBtn: {paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ffffff18', borderRadius: 2},
  backBtnText: {color: '#a898c8', fontSize: 9, letterSpacing: 1},
  headerTitle: {color: '#e8d97a', fontSize: 10, letterSpacing: 2},
  statsRow: {flexDirection: 'row', gap: 12},
  statText: {color: '#a898c8', fontSize: 12},
  mapArea: {flex: 1, position: 'relative'},
  regionNode: {position: 'absolute', width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  nodePulse: {position: 'absolute', width: 40, height: 40, borderRadius: 20},
  nodeCore: {width: 40, height: 40, borderRadius: 20, borderWidth: 2, backgroundColor: '#0a0710cc', alignItems: 'center', justifyContent: 'center'},
  nodeIcon: {fontSize: 18},
  nodeLabel: {position: 'absolute', bottom: 46, backgroundColor: '#0d0920ee', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 2, minWidth: 130, alignItems: 'center'},
  nodeLabelElement: {fontSize: 9, letterSpacing: 2, marginBottom: 2},
  nodeLabelName: {color: '#e8dcc8', fontSize: 13},
  detailPanel: {position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 60, paddingBottom: 36, paddingHorizontal: 24},
  panelContent: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
  panelLeft: {flex: 1, marginRight: 16},
  panelRight: {alignItems: 'center', gap: 10},
  panelElement: {fontSize: 10, letterSpacing: 2, marginBottom: 4},
  panelName: {fontSize: 20, color: '#f0d97a', marginBottom: 6, fontWeight: '700'},
  panelDesc: {fontSize: 13, color: '#a898c8', lineHeight: 19, marginBottom: 8, fontStyle: 'italic'},
  panelEggs: {fontSize: 12, color: '#9898a8'},
  exploreBtn: {paddingVertical: 13, paddingHorizontal: 24, borderRadius: 2, borderWidth: 1, borderColor: '#c9a0ff33'},
  exploreBtnText: {color: '#f0e8ff', fontSize: 10, letterSpacing: 2},
  dismissText: {color: '#ffffff33', fontSize: 12},
});
