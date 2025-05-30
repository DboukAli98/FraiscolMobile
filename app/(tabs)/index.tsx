// app/(tabs)/index.tsx
import { BottomModal } from '@/components/BottomModal/BottomModal';
import { Card, CardBody, CardHeader } from '@/components/Card/CardComponent';
import { CustomInput } from '@/components/CustomInput/CustomInput';
import { GhostIconButton } from '@/components/IconButton/IconButton';
import { IconLabelCard } from '@/components/IconLabelCard/IconLabelCard';
import { ScreenView } from '@/components/ScreenView/ScreenView';
import {
  colors,
  getButtonStyle,
  getTextStyle,
  spacingX,
  spacingY
} from '@/constants/theme';
import { QuickActionData, QuickActionItem } from '@/GeneralData/GeneralData';
import { useNotifications } from '@/hooks/useNotifications';
import useUserInfo from '@/hooks/useUserInfo';
import { useGetParentCurrentMonthTotalFees, useLogout } from '@/services/userServices';
import { SCREEN_HEIGHT } from '@/utils/stylings';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const userInfo = useUserInfo();

  const { hasRequestedPermission, requestNotificationPermission } = useNotifications(); // Add this

  const logoutUser = useLogout();

  const getParentCurrentMonthTotalFees = useGetParentCurrentMonthTotalFees();


  //#region States

  const [basicModalVisible, setBasicModalVisible] = useState(false);

  const [totalFees, setTotalFees] = useState<string>();
  const [loading, setLoading] = useState(false);


  //#endregion

  //#region Fetchings

  const fetchParentCurrentMonthTotalFee = async () => {
    try {
      setLoading(true);
      const parentId = typeof userInfo?.parentId === 'number'
        ? userInfo.parentId
        : Number(userInfo?.parentId ?? 0);
      const { success, data, error } = await getParentCurrentMonthTotalFees({ parentId });

      if (success) {
        setTotalFees(data?.data || "0");

      }

      if (error) {
        console.log("error in fetching parent total fee ::: ", error)
      }

    } catch (error) {
      console.log("internal error in fetching parent total fee ::: ", error)
      setTotalFees("0");
    } finally {
      setLoading(false);

    }
  }



  //#endregion


  //#region Handlers

  const handleQuickAction = (action: QuickActionItem) => {
    router.push(action.route as any);
  };

  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      if (success) {
        router.replace("/(auth)/login");
      }
      else {
        Alert.alert("Erreur", error || "Une erreur s'est produite lors de la déconnexion.");
      }
    } catch (error) {
      Alert.alert("Erreur Une erreur s'est produite lors de la déconnexion.");
    }
  }


  const handleExpand = () => {
    console.log('Modal expanded!');

  };

  const handleCollapse = () => {
    console.log('Modal collapsed!');

  };


  //#endregion

  //#region Use Effects
  useEffect(() => {
    if (!hasRequestedPermission) {

      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasRequestedPermission, requestNotificationPermission]);

  useEffect(() => {
    fetchParentCurrentMonthTotalFee()
  }, [userInfo?.parentId])

  //#endregion

  return (
    <ScreenView safeArea={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.greetingSection}>
            <Text style={styles.nameTextGreeting}>
              Bonjour,
            </Text>
            <Text style={styles.nameText}>
              {userInfo?.name || ""}
            </Text>
          </View>
          <View style={styles.greetingSection}>
            <GhostIconButton
              iconName="notifications-outline"
              size="md"
              //onPress={() => handlePress('Notifications')}
              accessibilityLabel="Notifications"
            />

          </View>

        </View>

        <Card borderRadius={"_10"} style={styles.cardContainer}>
          <CardHeader titleStyle={styles.cardHeaderTitleStyle} title='Total à payer ce mois-ci' />

          <CardBody style={styles.mainCardBody}>
            <Text style={styles.mainCardAmountText}>{totalFees}</Text>
            <Text style={styles.mainCardCurrencyText}>CFA</Text>
          </CardBody>

        </Card>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>

          <View style={styles.actionsGrid}>
            {QuickActionData.map((action) => (
              <IconLabelCard
                key={action.id}
                imageSource={action.img}
                label={action.label}
                size="sm"
                labelStyle={styles.actionCardLabelStyle}
                onPress={() => handleQuickAction(action)}
                accessibilityLabel={`Accéder à ${action.label}`}
                style={styles.actionCard}
              />
            ))}
          </View>
        </View>


        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>

          <Card borderRadius={"_10"} style={styles.cardContainer}>
            <CardBody>
              <Text style={styles.transactionsNotFoundText}>Aucune transaction récente</Text>
            </CardBody>



          </Card>
        </View>



        <View style={styles.actionSection}>
          <Pressable
            style={styles.merchandiseButton}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Go to Merchandise</Text>
          </Pressable>

        </View>
      </View>
      {/* Basic Modal */}
      <BottomModal
        visible={basicModalVisible}
        onClose={() => setBasicModalVisible(false)}
        title="Ajouter un enfant"
        subtitle="Ajouter votre enfant"
        height={SCREEN_HEIGHT * 0.5}
        enableDragToExpand={true}
        onExpand={handleExpand}
        onCollapse={handleCollapse}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            This is the content of the modal. You can put any components here.
          </Text>
          <CustomInput
            id='test-input'
            label='test'

            disabled={false}
          />

          <View style={styles.modalActions}>
            <GhostIconButton
              iconName="heart-outline"
              onPress={() => Alert.alert('Liked!')}
            />
            <GhostIconButton
              iconName="share-outline"
              onPress={() => Alert.alert('Shared!')}
            />
            <GhostIconButton
              iconName="bookmark-outline"
              onPress={() => Alert.alert('Bookmarked!')}
            />
          </View>
        </View>
      </BottomModal>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  header: {
    marginBottom: spacingY._30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: "center",

  },
  greetingSection: {
    alignItems: 'flex-start'
  },
  welcomeText: {
    ...getTextStyle('xs', 'bold', colors.primary.main),
    marginBottom: spacingY._7,
    textAlign: 'center',
  },
  nameTextGreeting: {
    ...getTextStyle('sm', 'bold', colors.text.secondary),
    textAlign: 'center',

  },
  nameText: {
    ...getTextStyle('lg', 'extrabold', colors.text.secondary),
    textAlign: 'center',

  },

  cardContainer: {
    backgroundColor: colors.background.default,

  },

  cardHeaderTitleStyle: {
    ...getTextStyle('md', 'bold', colors.text.secondary),
    textAlign: "center"

  },
  mainCardBody: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

  },
  mainCardAmountText: {
    ...getTextStyle('3xl', 'bold', colors.text.secondary),
    textAlign: "center"
  },
  mainCardCurrencyText: {
    ...getTextStyle('xl', 'bold', colors.text.secondary),
    textAlign: "center"
  },
  quickActionsSection: {

  },
  actionSection: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  transactionsSection: {

  },

  sectionTitle: {
    ...getTextStyle('md', 'semibold', colors.text.secondary),
    marginBottom: spacingY._10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacingX._5,
  },
  actionCard: {
    width: '30%',
    marginBottom: spacingY._15,
    backgroundColor: colors.background.default,
  },
  actionCardLabelStyle: {
    ...getTextStyle('xs', 'medium', colors.text.secondary),


  },
  merchandiseButton: {
    ...getButtonStyle('lg', 'primary'),
    width: "100%",
    marginBottom: spacingY._15,
  },
  buttonText: {
    ...getTextStyle('md', 'semibold', colors.text.white),
  },
  secondaryButton: {
    ...getButtonStyle('md', 'outline'),
    width: "100%",
    marginBottom: spacingY._15,
  },
  secondaryButtonText: {
    ...getTextStyle('base', 'medium', colors.primary.main),
  },
  transactionsNotFoundText: {
    ...getTextStyle('xs', 'bold', colors.primary.main),
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingTop: spacingY._20,
  },
  modalText: {
    ...getTextStyle('base', 'normal', colors.text.primary),
    textAlign: 'center',
    marginBottom: spacingY._25,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacingY._20,
  },
});