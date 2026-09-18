import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:zaad/core/utils/app_colors/app_colors.dart';
import 'package:zaad/core/utils/app_strings.dart';

class SuggestedQuestionsList extends StatelessWidget {
  const SuggestedQuestionsList({super.key});

  @override
  Widget build(BuildContext context) {
    final List<String> suggestions = [
      AppStrings.suggestQuestion1,
      AppStrings.suggestQuestion2,
      AppStrings.suggestQuestion3,
      AppStrings.suggestQuestion4,
      AppStrings.suggestQuestion5,
      AppStrings.suggestQuestion6,
    ];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children:
            suggestions.map((text) => _buildSuggestionItem(text)).toList(),
      ),
    );
  }

  Widget _buildSuggestionItem(String text) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(30.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: AppColors.primary,
          fontSize: 15.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
