import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Something a child can pick up and move anywhere. A tap without moving calls `onTap`.
 * Positions are kept by the component, so play stays open-ended: nothing snaps or scores.
 */
export function Draggable({
  x,
  y,
  children,
  onTap,
  onDrop,
  style,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  onTap?: () => void;
  onDrop?: (x: number, y: number) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const last = useRef({ x, y });
  const moved = useRef(false);
  const lift = useRef(new Animated.Value(1)).current;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          moved.current = false;
          Animated.spring(lift, { toValue: 1.12, useNativeDriver: false }).start();
        },
        onPanResponderMove: (_, g) => {
          if (Math.abs(g.dx) + Math.abs(g.dy) > 6) moved.current = true;
          pos.setValue({ x: last.current.x + g.dx, y: last.current.y + g.dy });
        },
        onPanResponderRelease: (_, g) => {
          Animated.spring(lift, { toValue: 1, friction: 4, useNativeDriver: false }).start();
          last.current = { x: last.current.x + g.dx, y: last.current.y + g.dy };
          if (!moved.current) onTap?.();
          else onDrop?.(last.current.x, last.current.y);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [pos, lift, onTap, onDrop],
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        { position: 'absolute', left: 0, top: 0, transform: [{ translateX: pos.x }, { translateY: pos.y }, { scale: lift }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
