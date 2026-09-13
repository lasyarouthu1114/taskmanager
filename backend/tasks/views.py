from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Task, Habit, HabitLog
from .serializers import TaskSerializer, HabitSerializer, HabitLogSerializer

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
class HabitListCreateView(generics.ListCreateAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class HabitLogListCreateView(generics.ListCreateAPIView):
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer


class HabitLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HabitLog.objects.all()
    serializer_class = HabitLogSerializer