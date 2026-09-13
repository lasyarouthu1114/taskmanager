from django.urls import path
from django.urls import path
from .views import (
    TaskListCreateView, TaskDetailView,
    HabitListCreateView, HabitDetailView,
    HabitLogListCreateView, HabitLogDetailView,
)

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),

    path('habits/', HabitListCreateView.as_view(), name='habit-list-create'),
    path('habits/<int:pk>/', HabitDetailView.as_view(), name='habit-detail'),

    path('habit-logs/', HabitLogListCreateView.as_view(), name='habitlog-list-create'),
    path('habit-logs/<int:pk>/', HabitLogDetailView.as_view(), name='habitlog-detail'),
]
