import 'package:flutter/material.dart';

extension MediaQueryExtension on BuildContext {
  double get screenWidth => MediaQuery.of(this).size.width;
  double get screenHeight => MediaQuery.of(this).size.height;

  /// Width scaled by percentage of screen width (0-100).
  double w(double percent) => screenWidth * (percent / 100);

  /// Height scaled by percentage of screen height (0-100).
  double h(double percent) => screenHeight * (percent / 100);

  /// Simple font scale based on shortest side (design base width: 375).
  double sp(double fontSize) {
    final shortestSide = MediaQuery.of(this).size.shortestSide;
    return fontSize * (shortestSide / 375);
  }
}

