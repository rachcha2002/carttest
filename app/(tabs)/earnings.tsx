// ... existing code ...
              className={`flex-1 py-2 px-4 rounded-lg ${selectedPeriod === 'today' ? 'bg-white' : ''}`}
              onPress={() => setSelectedPeriod('today')}>
              <Text className={`text-center ${selectedPeriod === 'today' ? 'text-primary font-medium' : 'text-white'}`}>
                Today
              </Text>
// ... existing code ...